/**
 * Author: Samir <samirdiff@proton.me>
 */

import type { SuccessResp, ErrorResp } from "./types/API";

export async function fetchData<T>(
  url: string | URL,
  fetchParams: RequestInit,
): Promise<SuccessResp & T> {
  try {
    const res = await fetch(url, fetchParams);
    const resp = (await res.json()) as SuccessResp | ErrorResp;

    if (!res.ok) {
      const error =
        resp && "error" in resp
          ? resp.error
          : `HTTP error! Status: ${res.status}`;
      throw new Error(error);
    }

    resp["status"] = "success";
    if (!isValidSuccessResp(resp)) {
      throw new Error("Invalid success response structure");
    }

    return resp as SuccessResp & T;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

function isValidSuccessResp(response: any): response is SuccessResp {
  return (
    response &&
    typeof response === "object" &&
    "status" in response &&
    response.status === "success"
  );
}
