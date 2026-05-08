import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, RefreshCw, ExternalLink } from 'lucide-react';

const CATEGORIES = ['general', 'technology', 'science', 'business', 'health'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function NewsWidget({ newsData, currentCategory, onCategoryChange, isLoading, error, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'source'

  // Filter and sort the news
  const processedNews = useMemo(() => {
    if (!newsData) return [];
    
    let filtered = newsData.filter(article => 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      } else {
        return (a.source?.name || '').localeCompare(b.source?.name || '');
      }
    });

    return filtered.slice(0, 5); // Show only 5 articles as requested
  }, [newsData, searchTerm, sortBy]);

  // For the chart, we might just show distribution of sources in the current category, or if we had all categories, we'd show category distribution. 
  // Since we only fetch one category at a time to save API calls, we will show "News Distribution by Source".
  const chartData = useMemo(() => {
    if (!newsData) return [];
    const sourceCount = {};
    newsData.forEach(article => {
      const source = article.source?.name || 'Unknown';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    return Object.entries(sourceCount).map(([name, value]) => ({ name, value })).slice(0, 5); // Top 5 sources
  }, [newsData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* News List */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md border p-6 lg:col-span-2 flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Latest News</h2>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="Search news..." 
                className="pl-8 pr-4 py-2 w-full bg-secondary border-none rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-secondary px-3 py-2 rounded-lg border-none outline-none focus:ring-2 focus:ring-primary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Latest</option>
              <option value="source">Source</option>
            </select>
            <button 
              onClick={() => onRefresh(currentCategory)} 
              disabled={isLoading}
              className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                currentCategory === cat 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg mt-4 text-center">
            <p>{error}</p>
            <button onClick={() => onRefresh(currentCategory)} className="mt-2 underline font-semibold">Try Again</button>
          </div>
        ) : isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <RefreshCw className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : processedNews.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-muted-foreground">
            No articles found.
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-grow overflow-y-auto pr-2">
            {processedNews.map((article, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors">
                {article.urlToImage && (
                  <img src={article.urlToImage} alt={article.title} className="w-full md:w-32 h-24 object-cover rounded-md" />
                )}
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-semibold line-clamp-2 leading-tight mb-1">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{article.description}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{article.source?.name} • {new Date(article.publishedAt).toLocaleDateString()}</span>
                    <a href={article.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline font-medium">
                      Read More <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart Panel */}
      <div className="bg-card text-card-foreground rounded-xl shadow-md border p-6 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">News Sources ({currentCategory})</h3>
        <div className="flex-grow min-h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Not enough data
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
