const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export async function fetchNews(category = 'general') {
  const cacheKey = `news_${category}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.data;
    }
  }

  try {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY;
    let url = '';

    if (apiKey && apiKey.trim() !== '') {
      // Use official NewsAPI if key is provided
      url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=10&apiKey=${apiKey}`;
    } else {
      // Fallback to a free public NewsAPI mirror (saurav.tech) that requires no key
      url = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/us.json`;
    }
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.status}`);
    }
    const data = await res.json();

    if (data.status === 'error') {
      throw new Error(data.message);
    }

    // Cache the successful response
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: data.articles
    }));

    return data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}
