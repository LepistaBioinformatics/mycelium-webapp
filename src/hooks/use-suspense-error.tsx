"use client";

import { setNotification } from "@/states/notification.state";
import { useDispatch } from "react-redux";

export default function useSuspenseError() {
  const dispatch = useDispatch();

  const parseError = async (res: Response) => {
    //
    // If the response is null, return null.
    //
    if (!res) return null;

    //
    // If the response is ok, return the response json.
    //
    if (res.ok) return res.json();

    if (res.status >= 400 && res.status < 500) {
      //
      // Try to parse error response as JSON. If it fails, set the error 
      // to the response text.
      //
      const rawError = await res.text();

      try {
        const json = JSON.parse(rawError);

        if (json.msg) {
          dispatch(setNotification({ notification: json, type: "error" }));
        } else {
          dispatch(setNotification({ notification: rawError, type: "error" }));
        }
      } catch (err) {
        dispatch(setNotification({ notification: rawError, type: "error" }));
      }

      return null;
    }
  };

  return { parseError };
}
