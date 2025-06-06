// Web Worker for searching cars by model and brand
self.onmessage = async (e) => {
  try {
    const { searchTerm, endpoint } = e.data

    if (!searchTerm || !endpoint) {
      self.postMessage({ error: "Missing search term or endpoint" })
      return
    }

    // Fetch all cars
    const response = await fetch(endpoint)

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    const cars = await response.json()

    // Search by model or brand
    const searchTermLower = searchTerm.toLowerCase()
    const results = cars.filter((car: any) => {
      return car.model?.toLowerCase().includes(searchTermLower) || car.brand?.toLowerCase().includes(searchTermLower)
    })

    // Send results back to main thread
    self.postMessage({ results })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}
