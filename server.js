import express from 'express'
import puppeteer from 'puppeteer'

const app = express()
app.use(express.json())

app.post('/scrape-price', async (req, res) => {
  const { address, type } = req.body

  const url = type === 'store'
    ? 'https://deliveryprice.cc/find'
    : 'https://deliveryprice.cc/couriers'

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()

    await page.goto(url, { waitUntil: 'networkidle2' })

    await page.type('input[name="address"]', address)
    await page.click('button[type="submit"]')

    await page.waitForSelector('.price-result, .result-price, .price-block', { timeout: 10000 })

    const priceText = await page.evaluate(() => {
      const el = document.querySelector('.price-result, .result-price, .price-block')
      return el ? el.textContent : null
    })

    const price = priceText ? parseInt(priceText.replace(/[^\d]/g, '')) : null

    await browser.close()

    if (!price) throw new Error('Price not found')
    res.json({ price, success: true })

  } catch (err) {
    console.error('[Scraper Error]', err)
    res.status(500).json({ error: 'Scraping failed', message: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Scraper running on port ${PORT}`))
server.js 
