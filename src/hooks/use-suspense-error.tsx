"use client";

import { setNotification } from "@/states/notification.state";
import { useDispatch } from "react-redux";

export default function useSuspenseError() {
  const dispatch = useDispatch();

  const parseHttpError = async (res: Response) => {
    //
    // If the response is null, return null.
    //
    if (!res) return null;

    //
    // If the response is ok, return the response json.
    //
    if (res.ok) return res.json();

    //
    // Try to parse error response as JSON. If it fails, set the error 
    // to the response text.
    //
    const rawError = await res.text();

    try {
      const json = JSON.parse(rawError);
      const type = setHttpErrorType(res.status);

      if (json.msg) {
        dispatch(setNotification({ notification: json, type }));
      } else {
        dispatch(setNotification({ notification: rawError, type }));
      }
    } catch (err) {
      dispatch(setNotification({ notification: rawError, type: "error" }));
    }

    return null;
  };

  const parseAuth0Error = async (err: Error) => {
    dispatch(setNotification({
      notification: err.message, title: err.name, type: "error"
    }));
  };

  return { parseHttpError, parseAuth0Error };
}

function setHttpErrorType(status: number) {
  switch (true) {
    case status >= 500:
      return "error";
    case status >= 400 && status < 500:
      return "warning";
    case status >= 300 && status < 400:
      return "info";
    default:
      return "error";
  }
}
