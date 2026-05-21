import { useState, useEffect } from 'react';

export const useSearch = (initialData, searchFunction) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(initialData);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(initialData);
    } else {
      const filtered = searchFunction(initialData, searchTerm);
      setFilteredData(filtered);
    }
  }, [searchTerm, initialData, searchFunction]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    setFilteredData
  };
};