import FilterBar, { DateFilter, SearchFilter, SelectFilter } from './FilterBar'

// state : le résultat de useMouvementFilters
export default function MouvementFilters({ state, summary, searchPlaceholder }) {
  const { filters, setFilter, reset, hasActive, typeOptions } = state

  return (
    <FilterBar hasActiveFilters={hasActive} onReset={reset} summary={summary}>
      <SearchFilter
        value={filters.search}
        onChange={(value) => setFilter('search', value)}
        placeholder={searchPlaceholder}
      />
      <SelectFilter
        label="Type"
        placeholder="Tous les types"
        options={typeOptions}
        value={filters.type}
        onChange={(value) => setFilter('type', value)}
      />
      <DateFilter
        label="Du"
        value={filters.from}
        max={filters.to || undefined}
        onChange={(value) => setFilter('from', value)}
      />
      <DateFilter
        label="Au"
        value={filters.to}
        min={filters.from || undefined}
        onChange={(value) => setFilter('to', value)}
      />
    </FilterBar>
  )
}