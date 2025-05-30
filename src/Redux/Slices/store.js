import { configureStore } from "@reduxjs/toolkit";
import generatedWeightsReducer from "./generatedStatesSlice.js";
import progressReducer from "./progressSlice.js";
import coursesReducer from "./courseSlice.js";

const store = configureStore({
  reducer: {
    generatedWeights: generatedWeightsReducer,
    courses: coursesReducer,
    progress: progressReducer,
  },
});

export default store;
