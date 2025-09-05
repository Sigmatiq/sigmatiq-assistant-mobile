import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { sigmatiqTheme } from '../theme';
import { apiClient, buildApiPath } from '../services/client';
import { Feather } from '@expo/vector-icons';

interface WatchlistSymbol {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
}

interface WatchlistData {
  watchlist_id: string;
  name: string;
  description?: string;
  symbol_count: number;
  symbols: WatchlistSymbol[];
  _cache_metadata?: {
    source: string;
    cached_at?: string;
  };
}

interface UserWatchlist {
  watchlist_id: string;
  name: string;
  description?: string;
  symbol_count?: number;
  is_default?: boolean;
}

export const WatchlistCard: React.FC = () => {
  const [watchlists, setWatchlists] = useState<UserWatchlist[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [watchlistData, setWatchlistData] = useState<WatchlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Fetch user's watchlists
  const fetchWatchlists = async () => {
    try {
      const response = await apiClient.get(buildApiPath('assistant', '/watchlists'));
      const lists = response.data;
      setWatchlists(lists);
      
      // Auto-select default or first watchlist
      if (lists.length > 0) {
        const defaultList = lists.find((w: UserWatchlist) => w.is_default);
        setSelectedWatchlistId(defaultList?.watchlist_id || lists[0].watchlist_id);
      }
    } catch (err) {
      console.error('Failed to fetch watchlists:', err);
      setError('Failed to load watchlists');
    }
  };

  // Fetch watchlist snapshot data
  const fetchWatchlistData = async (watchlistId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(
        buildApiPath('assistant', `/watchlists/${watchlistId}/snapshot`)
      );
      setWatchlistData(response.data);
    } catch (err) {
      console.error('Failed to fetch watchlist data:', err);
      setError('Failed to load watchlist data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  useEffect(() => {
    if (selectedWatchlistId) {
      fetchWatchlistData(selectedWatchlistId);
    }
  }, [selectedWatchlistId]);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const selectedWatchlist = watchlists.find(w => w.watchlist_id === selectedWatchlistId);

  if (watchlists.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Feather name="eye" size={20} color={sigmatiqTheme.colors.text.primary} style={styles.icon} />
            <Text style={styles.title}>Watchlist</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No watchlists created yet</Text>
          <Text style={styles.emptySubtext}>Create a watchlist to track your favorite symbols</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="eye" size={20} color={sigmatiqTheme.colors.text.primary} style={styles.icon} />
          <Text style={styles.title}>Watchlist</Text>
          {watchlistData?._cache_metadata?.source === 'cache' && (
            <View style={styles.cacheIndicator}>
              <Text style={styles.cacheText}>Cached</Text>
            </View>
          )}
        </View>
        
        {watchlists.length > 0 && (
          <Pressable
            style={styles.selector}
            onPress={() => setShowSelector(!showSelector)}
          >
            <Text style={styles.selectorText}>
              {selectedWatchlist?.name || 'Select Watchlist'}
            </Text>
            <Feather 
              name={showSelector ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={sigmatiqTheme.colors.text.secondary}
            />
          </Pressable>
        )}
      </View>

      {showSelector && (
        <View style={styles.dropdown}>
          {watchlists.map((watchlist) => (
            <Pressable
              key={watchlist.watchlist_id}
              style={[
                styles.dropdownItem,
                watchlist.watchlist_id === selectedWatchlistId && styles.dropdownItemSelected
              ]}
              onPress={() => {
                setSelectedWatchlistId(watchlist.watchlist_id);
                setShowSelector(false);
              }}
            >
              <Text style={[
                styles.dropdownText,
                watchlist.watchlist_id === selectedWatchlistId && styles.dropdownTextSelected
              ]}>
                {watchlist.name}
                {watchlist.is_default && ' (Default)'}
              </Text>
              {watchlist.description && (
                <Text style={styles.dropdownDescription}>{watchlist.description}</Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={sigmatiqTheme.colors.text.accent} />
          <Text style={styles.loadingText}>Loading watchlist...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => selectedWatchlistId && fetchWatchlistData(selectedWatchlistId)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : watchlistData && watchlistData.symbols.length > 0 ? (
        <ScrollView style={styles.symbolsContainer} showsVerticalScrollIndicator={false}>
          {watchlistData.symbols.map((symbol) => (
            <View key={symbol.symbol} style={styles.symbolRow}>
              <View style={styles.symbolInfo}>
                <Text style={styles.symbolTicker}>{symbol.symbol}</Text>
                {symbol.name && (
                  <Text style={styles.symbolName} numberOfLines={1}>
                    {symbol.name}
                  </Text>
                )}
              </View>
              <View style={styles.priceInfo}>
                <Text style={styles.price}>${formatPrice(symbol.price)}</Text>
                <Text style={[
                  styles.change,
                  symbol.change >= 0 ? styles.changePositive : styles.changeNegative
                ]}>
                  {formatChange(symbol.change, symbol.change_percent)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No symbols in this watchlist</Text>
          <Text style={styles.emptySubtext}>Add symbols to track their performance</Text>
        </View>
      )}

      {watchlistData && watchlistData.symbol_count > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {watchlistData.symbol_count} symbol{watchlistData.symbol_count !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: sigmatiqTheme.colors.background.card,
    borderRadius: sigmatiqTheme.spacing.sm,
    padding: sigmatiqTheme.spacing.md,
    marginBottom: sigmatiqTheme.spacing.md,
  },
  header: {
    marginBottom: sigmatiqTheme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sigmatiqTheme.spacing.xs,
  },
  icon: {
    marginRight: sigmatiqTheme.spacing.xs,
  },
  title: {
    ...sigmatiqTheme.typography.h3,
    color: sigmatiqTheme.colors.text.primary,
    flex: 1,
  },
  cacheIndicator: {
    backgroundColor: sigmatiqTheme.colors.background.secondary,
    paddingHorizontal: sigmatiqTheme.spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cacheText: {
    ...sigmatiqTheme.typography.caption,
    color: sigmatiqTheme.colors.text.secondary,
    fontSize: 10,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sigmatiqTheme.spacing.xs,
    paddingHorizontal: sigmatiqTheme.spacing.sm,
    backgroundColor: sigmatiqTheme.colors.background.secondary,
    borderRadius: sigmatiqTheme.spacing.xs,
  },
  selectorText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.primary,
  },
  dropdown: {
    backgroundColor: sigmatiqTheme.colors.background.secondary,
    borderRadius: sigmatiqTheme.spacing.xs,
    marginBottom: sigmatiqTheme.spacing.md,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: sigmatiqTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: sigmatiqTheme.colors.background.primary,
  },
  dropdownItemSelected: {
    backgroundColor: sigmatiqTheme.colors.background.card,
  },
  dropdownText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.primary,
  },
  dropdownTextSelected: {
    color: sigmatiqTheme.colors.text.accent,
    fontWeight: '600',
  },
  dropdownDescription: {
    ...sigmatiqTheme.typography.caption,
    color: sigmatiqTheme.colors.text.secondary,
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sigmatiqTheme.spacing.lg,
  },
  loadingText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.secondary,
    marginLeft: sigmatiqTheme.spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: sigmatiqTheme.spacing.lg,
  },
  errorText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.semantic.error,
    marginBottom: sigmatiqTheme.spacing.sm,
  },
  retryButton: {
    paddingHorizontal: sigmatiqTheme.spacing.md,
    paddingVertical: sigmatiqTheme.spacing.xs,
    backgroundColor: sigmatiqTheme.colors.text.accent,
    borderRadius: sigmatiqTheme.spacing.xs,
  },
  retryText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.background.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: sigmatiqTheme.spacing.lg,
  },
  emptyText: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.secondary,
    marginBottom: sigmatiqTheme.spacing.xs,
  },
  emptySubtext: {
    ...sigmatiqTheme.typography.caption,
    color: sigmatiqTheme.colors.text.tertiary,
  },
  symbolsContainer: {
    maxHeight: 300,
  },
  symbolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: sigmatiqTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: sigmatiqTheme.colors.background.secondary,
  },
  symbolInfo: {
    flex: 1,
  },
  symbolTicker: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.primary,
    fontWeight: '600',
  },
  symbolName: {
    ...sigmatiqTheme.typography.caption,
    color: sigmatiqTheme.colors.text.secondary,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    ...sigmatiqTheme.typography.body,
    color: sigmatiqTheme.colors.text.primary,
    fontWeight: '500',
  },
  change: {
    ...sigmatiqTheme.typography.caption,
    marginTop: 2,
  },
  changePositive: {
    color: sigmatiqTheme.colors.semantic.success,
  },
  changeNegative: {
    color: sigmatiqTheme.colors.semantic.error,
  },
  footer: {
    marginTop: sigmatiqTheme.spacing.sm,
    paddingTop: sigmatiqTheme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: sigmatiqTheme.colors.background.secondary,
  },
  footerText: {
    ...sigmatiqTheme.typography.caption,
    color: sigmatiqTheme.colors.text.secondary,
    textAlign: 'center',
  },
});