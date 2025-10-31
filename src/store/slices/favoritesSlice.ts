import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FavoritesState {
	ids: string[];
}

const initialState: FavoritesState = {
	ids: [],
};

const favoritesSlice = createSlice({
	name: "favorites",
	initialState,
	reducers: {
		toggleFavorite(state, action: PayloadAction<string>) {
			const id = action.payload;
			if (state.ids.includes(id)) {
				state.ids = state.ids.filter((x) => x !== id);
			} else {
				state.ids.push(id);
			}
		},
	},
});

export const { toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;


