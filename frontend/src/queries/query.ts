const sampleQuery = async (): Promise<string> => {
  const response = await fetch('/api')
  return response.text()
}

export {
  sampleQuery
}
