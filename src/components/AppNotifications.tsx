"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/states/store";
import SuspenseNotification from "./ui/SuspenseNotification";
import { clearNotification } from "@/states/notification.state";

export default function AppNotifications() {
  const { notification, title, type } = useSelector((state: RootState) => state.notification);
  const dispatch = useDispatch();

  return (
    <SuspenseNotification
      show={notification !== null}
      setShow={() => dispatch(clearNotification())}
      response={notification}
      intent={type}
      title={title}
    />
  );
}
