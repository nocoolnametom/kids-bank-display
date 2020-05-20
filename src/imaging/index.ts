import puppeteer from "puppeteer-core";
import envvar from "envvar";

(async (chromiumPath: string, dashboardUrl: string, imageOutput: string) => {
  const browser = await puppeteer.launch({
    executablePath: chromiumPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 250, height: 122 });
  await page.goto(dashboardUrl);
  await page.screenshot({ path: imageOutput, });

  await browser.close();
})(
  envvar.string("CHROMIUM", "/usr/bin/chromium-browser"),
  envvar.string("DASHBOARD_URL", `http://localhost:${envvar.number("APP_PORT", 8090)}/`),
  envvar.string('IMAGE_OUTPUT', `${__dirname}/../../mockup.png`)
);