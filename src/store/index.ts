import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from "next-redux-wrapper";
import { combineReducers } from "redux";
import coinsReducer from "@/store/slices/coinsSlice";
import favoritesReducer from "@/store/slices/favoritesSlice";

const combinedReducer = combineReducers({
	coins: coinsReducer,
	favorites: favoritesReducer,
});

const reducer = (state: ReturnType<typeof combinedReducer> | undefined, action: any) => {
	if (action.type === HYDRATE) {
		return {
			...state,
			...action.payload,
		};
	}
	return combinedReducer(state, action);
};

export const makeStore = () =>
	configureStore({
		reducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware({ serializableCheck: false }),
	});

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = ReturnType<AppStore["dispatch"]>;
export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;

export const wrapper = createWrapper<AppStore>(makeStore);


