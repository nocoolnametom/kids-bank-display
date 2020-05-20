import type { Account } from "../interfaces/Account";
import type { LaunchOptions } from "puppeteer";
import puppeteer from "puppeteer";

const inBrowserFunc = (accountName: string) => {
  const accounts: Account[] = [];

  const ellist = document.querySelectorAll("tr.group-row h2");

  const NullEl = document.createElement("span");
  let el = Array.from(ellist).reduce(
    (acc, curr) =>
      curr.textContent && curr.textContent.toLowerCase() === accountName
        ? curr
        : acc,
    NullEl
  );

  if (el === NullEl || el.parentElement === null) {
    return accounts;
  }

  do {
    if (el.parentElement === NullEl) {
      break;
    }

    el = el.parentElement || NullEl;
  } while (!el.classList.contains("group-row"));

  do {
    el = el.nextElementSibling || NullEl;

    if (el === NullEl) {
      break;
    }

    if (typeof el.querySelector === "function") {
      const name = (el.querySelector("span.name") || NullEl).textContent || "";
      const credit = parseFloat(
        ((el.querySelector("span.credit") || NullEl).textContent || "").replace(
          "$",
          ""
        )
      );
      // Account Row
      accounts.push({
        name,
        credit,
      });
    }
  } while (el && (!el.classList || !el.classList.contains("group-row")));

  return accounts;
};

export const famzooPuppet: (
  isNixos: boolean,
  chromiumPath: string,
  famzooFamily: string,
  famzooMember: string,
  famzooPassword: string,
  kidName: string
) => Promise<Account[]> = async (isNixos, chromiumPath, famzooFamily, famzooMember, famzooPassword, kidName) => {
  try {
    const launchOptions: LaunchOptions = {};

    if (isNixos) {
      launchOptions.executablePath = chromiumPath;
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.goto("https://app.famzoo.com/ords/f?p=197:101:0:", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector('[name="famname"]');
    await page.waitForSelector('[name="memname"]');
    await page.waitForSelector('[name="password"]');

    await page.type("#fzi_signin_famname", famzooFamily);
    await page.type("#fzi_signin_memname", famzooMember);
    await page.type("#fzi_signin_password", famzooPassword);

    await page.click("#fzi_signin_bsignin");

    await page.waitForSelector("#fztabmyfzbank");

    await page.waitFor(
      (selector) => !document.querySelector(selector),
      {},
      "#portletprogresscontent1.busy"
    );

    await page.click("#fztabmyfzbank");

    await page.waitForSelector("#fztblaccts");

    const accounts = (
      await page.evaluate(inBrowserFunc, kidName.toLowerCase())
    ).filter((acc) => acc.name && acc.credit);

    await browser.close();

    return accounts;
  } catch (err) {
    console.error(kidName, err);
    return [];
  }
};
