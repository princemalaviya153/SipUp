export const juicesAndShakes = [
  { id: 1, name: 'Watermelon Juice', basePrice: 80, category: 'juice', baseFruit: 'Watermelon' },
  { id: 2, name: 'Watermelon Mojito (w/ Sprite)', basePrice: 100, category: 'juice', baseFruit: 'Watermelon' },
  { id: 3, name: 'Orange Juice', basePrice: 70, category: 'juice', baseFruit: 'Orange' },
  { id: 4, name: 'Orange + Grapes', basePrice: 90, category: 'juice', baseFruit: 'Orange' },
  { id: 5, name: 'Orange + Kiwi', basePrice: 90, category: 'juice', baseFruit: 'Orange' },
  { id: 6, name: 'Chikoo Shake', basePrice: 85, category: 'shake', baseFruit: 'Chikoo' },
  { id: 7, name: 'Chikoo Shake + Vanilla Ice Cream', basePrice: 110, category: 'shake', baseFruit: 'Chikoo' },
  { id: 8, name: 'Pineapple Juice', basePrice: 75, category: 'juice', baseFruit: 'Pineapple' },
  { id: 9, name: 'Pineapple + Grapes', basePrice: 95, category: 'juice', baseFruit: 'Pineapple' },
  { id: 10, name: 'Pineapple + Kiwi', basePrice: 95, category: 'juice', baseFruit: 'Pineapple' },
  { id: 11, name: 'Strawberry Juice', basePrice: 90, category: 'juice', baseFruit: 'Strawberry' },
  { id: 12, name: 'Strawberry + Kiwi/Grapes/Blueberry', basePrice: 110, category: 'juice', baseFruit: 'Strawberry' },
  { id: 13, name: 'Guava Juice', basePrice: 70, category: 'juice', baseFruit: 'Guava' },
  { id: 14, name: 'Guava Mojito (w/ Sprite)', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 15, name: 'Guava + Grapes', basePrice: 90, category: 'juice', baseFruit: 'Guava' },
  { id: 16, name: 'Guava + Pineapple', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 17, name: 'Guava + Kiwi', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 18, name: 'Kiwi Juice', basePrice: 100, category: 'juice', baseFruit: 'Kiwi' },
  { id: 19, name: 'Kiwi with Blueberry', basePrice: 140, category: 'juice', baseFruit: 'Kiwi' },
  { id: 20, name: 'Kiwi with Strawberry', basePrice: 120, category: 'juice', baseFruit: 'Kiwi' },
  { id: 21, name: 'Kiwi Strawberry Blueberry', basePrice: 130, category: 'juice', baseFruit: 'Kiwi' },
  { id: 22, name: 'Tender Coconut Shake (w/ Milk)', basePrice: 85, category: 'shake', baseFruit: 'Tender Coconut' },
  { id: 23, name: 'Tender Coconut Shake (w/ Milk + Vanilla Ice Cream)', basePrice: 110, category: 'shake', baseFruit: 'Tender Coconut' },
  { id: 24, name: 'Mix Fruit Juice', basePrice: 70, category: 'juice', allowCustomization: true }
]

export const fruitPlates = [
  { id: 25, name: 'Small Fruit Plate', basePrice: 60, category: 'plate' },
  { id: 26, name: 'Premium Fruit Plate', basePrice: 100, category: 'plate' },
]

export const availableFruits = [
  'Watermelon', 'Orange', 'Grapes', 'Kiwi', 'Chikoo', 
  'Pineapple', 'Strawberry', 'Guava', 'Blueberry'
]

export const premiumFruits = ['Kiwi', 'Strawberry', 'Blueberry']

export const getFruitColor = (fruit) => {
  const colors = {
    'Watermelon': '#FF6B6B',
    'Orange': '#FF9500',
    'Grapes': '#9B59B6',
    'Kiwi': '#8BC34A',
    'Chikoo': '#D2691E',
    'Pineapple': '#FFE66D',
    'Strawberry': '#FF1744',
    'Guava': '#FF6B9D',
    'Tender Coconut': '#FFF8DC',
    'Blueberry': '#3F51B5'
  }
  return colors[fruit] || '#4ECDC4'
}
