import { format } from "date-fns";

export const CURRENT_DATE: string = format(new Date().getTime(), "dd/MM/yyyy");
export const CURRENT_TIME: string = format(new Date(), "HH:mm");

export const CLIENT_ID = "108285";
