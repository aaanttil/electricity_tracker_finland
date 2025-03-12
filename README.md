# electricity_prices
Prices of electricity in Finland/Europe. This project started as a Shiny app, but due to Shiny’s limitations with multipage applications, it was migrated to a Brochure app. There were problems with deploying the Brochure app with docker so the project was rewritten as a Next.js app, using (incremental) static (re)generation to create individual pages for each date.

The electricity prices are fetched from the ENTSO-E Transparency Platform via their REST API and then saved to a MySQL database. The app fetches data from a MySQL database and generates SEO-friendly pages for each date/week/month/etc.

