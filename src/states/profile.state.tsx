import { createReducer, createAsyncThunk } from "@reduxjs/toolkit";
import { buildPath } from "@/services/openapi/mycelium-api";
import useSWR from "swr";

const initialState = {
  profile: null,
  isLoadingUser: false,
  isLoadingProfile: false,
  adminAccess: false,
};

export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async () => {
    const { data } = useSWR(buildPath("/_adm/beginners/profile"), (url) =>
      fetch(url).then((res) => res.json())
    );

    return data;
  }
);

const profileReducer = createReducer(initialState, (builder) => {
  builder.addCase(fetchProfile.pending, (state) => {
    state.isLoadingProfile = true;
  });
});

export default profileReducer;
