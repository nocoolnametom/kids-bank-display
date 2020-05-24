import type {LaunchOptions} from "puppeteer";
import puppeteer from "puppeteer";
import envvar from "envvar";

const APP_PORT = envvar.number("APP_PORT", 8090);
const IS_NIXOS = !(!envvar.string("__NIXOS_SET_ENVIRONMENT_DONE", "0"));
const CHROMIUM = envvar.string("CHROMIUM", IS_NIXOS ? `${__dirname}/../../.node/bin/chromium` : "/usr/bin/chromium-browser");
const DASHBOARD_URL = envvar.string("DASHBOARD_URL", `http://localhost:${APP_PORT}/`);
const IMAGE_OUTPUT = envvar.string('IMAGE_OUTPUT', `${__dirname}/../../mockup.png`);

(async (isNixos: boolean, chromiumPath: string, dashboardUrl: string, imageOutput: string) => {
  const puppeteerOptions: LaunchOptions = {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  };
  if (isNixos || chromiumPath) {
    puppeteerOptions.executablePath = chromiumPath;
  }
  const browser = await puppeteer.launch(puppeteerOptions);
  const page = await browser.newPage();
  await page.setViewport({ width: 250, height: 122 });
  await page.goto(dashboardUrl);
  await page.screenshot({ path: imageOutput, });

  await browser.close();
})(
  IS_NIXOS,
  CHROMIUM,
  DASHBOARD_URL,
  IMAGE_OUTPUT
);