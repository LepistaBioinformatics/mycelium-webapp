"use client";

import { useState } from 'react';

interface Props {
  initialSkip?: number;
  initialPageSize?: number;
}

export default function useSearchBarParams(args: Props = {}) {
  const { initialSkip = 0, initialPageSize = 10 } = args;

  const [skip, setSkip] = useState(initialSkip);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  return { skip, pageSize, setSkip, setPageSize, searchTerm, setSearchTerm };
}
