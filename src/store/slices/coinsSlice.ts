import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export type Coin = {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	market_cap: number;
	price_change_percentage_24h: number;
};

export type CoinDetail = {
	id: string;
	name: string;
	symbol: string;
	description?: { en?: string };
	image?: { small?: string; large?: string };
};

export type MarketChartPoint = [number, number];

export interface CoinsState {
	items: Coin[];
	loading: boolean;
	error?: string | null;
	searchQuery: string;
	sortBy: "price" | "market_cap" | "change_24h";
	sortDir: "asc" | "desc";
	detail?: CoinDetail | null;
	chart7d?: MarketChartPoint[];
}

const initialState: CoinsState = {
	items: [],
	loading: false,
	error: null,
	searchQuery: "",
	sortBy: "market_cap",
	sortDir: "desc",
	detail: null,
	chart7d: [],
};

export const fetchTopCoins = createAsyncThunk<Coin[], void, { rejectValue: string }>(
	"coins/fetchTopCoins",
	async (_, { rejectWithValue }) => {
		try {
			const { data } = await axios.get<Coin[]>(
				"https://api.coingecko.com/api/v3/coins/markets",
				{
					params: {
						vs_currency: "usd",
						order: "market_cap_desc",
						per_page: 50,
						page: 1,
						sparkline: false,
						price_change_percentage: "24h",
					},
				}
			);
			return data;
		} catch (err: any) {
			return rejectWithValue(err?.message ?? "Failed to fetch coins");
		}
	}
);

export const fetchCoinDetail = createAsyncThunk<CoinDetail, { id: string }, { rejectValue: string }>(
	"coins/fetchCoinDetail",
	async ({ id }, { rejectWithValue }) => {
		try {
			const { data } = await axios.get<CoinDetail>(
				`https://api.coingecko.com/api/v3/coins/${id}`,
				{ params: { localization: false, tickers: false, market_data: false, community_data: false, developer_data: false, sparkline: false } }
			);
			return data;
		} catch (err: any) {
			return rejectWithValue(err?.message ?? "Failed to fetch coin detail");
		}
	}
);

export const fetchCoinChart7d = createAsyncThunk<MarketChartPoint[], { id: string }, { rejectValue: string }>(
	"coins/fetchCoinChart7d",
	async ({ id }, { rejectWithValue }) => {
		try {
			const { data } = await axios.get<{ prices: MarketChartPoint[] }>(
				`https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
				{ params: { vs_currency: "usd", days: 7 } }
			);
			return data.prices;
		} catch (err: any) {
			return rejectWithValue(err?.message ?? "Failed to fetch 7d chart");
		}
	}
);

const coinsSlice = createSlice({
	name: "coins",
	initialState,
	reducers: {
		setSearchQuery(state, action: PayloadAction<string>) {
			state.searchQuery = action.payload;
		},
		setSort(
			state,
			action: PayloadAction<{ sortBy: CoinsState["sortBy"]; sortDir: CoinsState["sortDir"] }>
		) {
			state.sortBy = action.payload.sortBy;
			state.sortDir = action.payload.sortDir;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchTopCoins.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchTopCoins.fulfilled, (state, action) => {
				state.loading = false;
				state.items = action.payload;
			})
			.addCase(fetchTopCoins.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Error";
			})
			.addCase(fetchCoinDetail.pending, (state) => {
				state.detail = null;
			})
			.addCase(fetchCoinDetail.fulfilled, (state, action) => {
				state.detail = action.payload;
			})
			.addCase(fetchCoinDetail.rejected, (state, action) => {
				state.error = action.payload ?? "Error";
			})
			.addCase(fetchCoinChart7d.fulfilled, (state, action) => {
				state.chart7d = action.payload;
			});
	},
});

export const { setSearchQuery, setSort } = coinsSlice.actions;
export default coinsSlice.reducer;


