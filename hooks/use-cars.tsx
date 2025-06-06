"use client"

import { useState, useEffect } from "react"
import type { Car } from "@/types/car"
import { z } from "zod"

interface UseCarsProps {
  page: number
  limit: number
  brand?: string
  search?: string
}

// Local storage key for cars
const CARS_STORAGE_KEY = "car-management-cars"

const carSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  color: z.string().min(1, "Color is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  vin: z.string().optional(),
  description: z.string().optional(),
  thumbnails: z.array(z.string()).optional(),
})

// Mock data for fallback
const mockCars: Car[] = [
  {
    id: "1",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    color: "Silver",
    price: 28000,
    vin: "1HGBH41JXMN109186",
    description: "Reliable sedan with excellent fuel economy",
    thumbnails: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=500&h=300&fit=crop",
    ],
  },
  {
    id: "2",
    brand: "Honda",
    model: "Civic",
    year: 2022,
    color: "Blue",
    price: 24000,
    vin: "2HGFC2F59NH123456",
    description: "Compact car perfect for city driving",
    thumbnails: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop"],
  },
  {
    id: "3",
    brand: "BMW",
    model: "X5",
    year: 2023,
    color: "Black",
    price: 65000,
    vin: "5UXCR6C0XN9123456",
    description: "Luxury SUV with premium features",
    thumbnails: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop"],
  },
  {
    id: "4",
    brand: "Ford",
    model: "F-150",
    year: 2023,
    color: "Red",
    price: 45000,
    vin: "1FTFW1ET5NFC12345",
    description: "America's best-selling truck",
    thumbnails: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500&h=300&fit=crop"],
  },
  {
    id: "5",
    brand: "Mercedes",
    model: "C-Class",
    year: 2022,
    color: "White",
    price: 55000,
    vin: "WDDGF4HB1NR123456",
    description: "Elegant luxury sedan",
    thumbnails: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop"],
  },
]

export function useCars({ page, limit, brand, search }: UseCarsProps) {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCars, setTotalCars] = useState(0)
  const [usingLocalStorage, setUsingLocalStorage] = useState(false)

  // Get cars from local storage
  const getCarsFromStorage = (): Car[] => {
    if (typeof window === "undefined") return mockCars

    try {
      const stored = localStorage.getItem(CARS_STORAGE_KEY)
      if (stored) {
        const parsedCars = JSON.parse(stored)
        return Array.isArray(parsedCars) ? parsedCars : mockCars
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error)
    }
    return mockCars
  }

  // Save cars to local storage
  const saveCarsToStorage = (carsData: Car[]) => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(carsData))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  }

  const fetchCars = async () => {
    try {
      setLoading(true)

      // Try to fetch from API first
      let allCars: Car[] = []
      let apiWorking = false

      try {
        const response = await fetch("https://json-api.uz/api/project/fn37/cars", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          allCars = Array.isArray(data) ? data : []
          apiWorking = true
          setUsingLocalStorage(false)

          // Save to localStorage as backup
          saveCarsToStorage(allCars)
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (fetchError) {
        console.warn("API fetch failed, using local storage:", fetchError)
        allCars = getCarsFromStorage()
        setUsingLocalStorage(true)
      }

      // Apply brand filter if specified
      let filteredCars = allCars
      if (brand && brand !== "all") {
        filteredCars = allCars.filter((car: Car) => car.brand && car.brand.toLowerCase() === brand.toLowerCase())
      }

      // Apply search filter if specified
      if (search) {
        const searchTermLower = search.toLowerCase()
        filteredCars = filteredCars.filter(
          (car: Car) =>
            (car.model && car.model.toLowerCase().includes(searchTermLower)) ||
            (car.brand && car.brand.toLowerCase().includes(searchTermLower)),
        )
      }

      // Calculate pagination
      const totalCount = filteredCars.length
      const calculatedTotalPages = Math.ceil(totalCount / limit)
      const skip = (page - 1) * limit
      const paginatedCars = filteredCars.slice(skip, skip + limit)

      setTotalCars(totalCount)
      setTotalPages(calculatedTotalPages)
      setCars(paginatedCars)
    } catch (error) {
      console.error("Error fetching cars:", error)
      // Fallback to local storage
      const fallbackCars = getCarsFromStorage()
      setCars(fallbackCars.slice(0, limit))
      setTotalCars(fallbackCars.length)
      setTotalPages(Math.ceil(fallbackCars.length / limit))
      setUsingLocalStorage(true)
    } finally {
      setLoading(false)
    }
  }

  // Add car function
  const addCar = (newCar: Omit<Car, "id">): Car => {
    const carWithId: Car = {
      ...newCar,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    const currentCars = getCarsFromStorage()
    const updatedCars = [...currentCars, carWithId]
    saveCarsToStorage(updatedCars)

    return carWithId
  }

  // Update car function
  const updateCar = (id: string, updatedData: Partial<Car>): boolean => {
    const currentCars = getCarsFromStorage()
    const carIndex = currentCars.findIndex((car) => car.id === id)

    if (carIndex === -1) return false

    currentCars[carIndex] = { ...currentCars[carIndex], ...updatedData }
    saveCarsToStorage(currentCars)

    return true
  }

  // Delete car function
  const deleteCar = (id: string): boolean => {
    const currentCars = getCarsFromStorage()
    const filteredCars = currentCars.filter((car) => car.id !== id)

    if (filteredCars.length === currentCars.length) return false

    saveCarsToStorage(filteredCars)
    return true
  }

  // Get single car function
  const getCar = (id: string): Car | null => {
    const currentCars = getCarsFromStorage()
    return currentCars.find((car) => car.id === id) || null
  }

  useEffect(() => {
    fetchCars()
  }, [page, limit, brand, search])

  // Initialize localStorage with mock data if empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CARS_STORAGE_KEY)
      if (!stored) {
        saveCarsToStorage(mockCars)
      }
    }
  }, [])

  return {
    cars,
    loading,
    totalPages,
    totalCars,
    fetchCars,
    addCar,
    updateCar,
    deleteCar,
    getCar,
    usingLocalStorage,
  }
}
