import type { RequestHandler } from "express";
import type { JsonResult } from "../interfaces/JsonResult";
import { existsSync, readFileSync } from "fs";
import { AccountValuesService } from "../services/AccountValuesService";

export function getAccountResultsFromJson(): JsonResult {
  try {
    const resultsFile = __dirname + "/../../../results.json";
    return existsSync(resultsFile)
      ? JSON.parse(readFileSync(resultsFile, "utf-8"))
      : {};
  } catch (err) {
    console.error(err);
    return {};
  }
}

export function getAccountRegexFromJson(): {[regex: string]: string} {
  try {
    const resultsFile = __dirname + "/../../../account_regex.json";
    return existsSync(resultsFile)
      ? JSON.parse(readFileSync(resultsFile, "utf-8"))
      : {};
  } catch (err) {
    console.error(err);
    return {};
  }
}

export function getNiceNowTime(): string {
  const now = new Date();
  return (
    now.getHours().toString() +
    ":" +
    now.getMinutes().toString().padStart(2, "0")
  );
}

export const AccountValuesController: (
  service: ReturnType<typeof AccountValuesService>
) => RequestHandler<{}> = (service) => ({}, response) => {
  const kids = service(getAccountResultsFromJson(), getAccountRegexFromJson());
  response.render("index.ejs", {
    kids,
    now: getNiceNowTime(),
  });
};
