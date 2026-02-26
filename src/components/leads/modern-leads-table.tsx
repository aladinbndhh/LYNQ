'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Plus,
  Columns3,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { ILead } from '@/types';

type SortField = 'name' | 'email' | 'company' | 'source' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const statusBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        qualified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        converted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
    },
  }
);

const sourceBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      source: {
        qr: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
        nfc: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
        link: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
        chat: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      },
    },
  }
);

interface ModernLeadsTableProps {
  leads: ILead[];
  onViewLead?: (id: string) => void;
  onEditLead?: (id: string) => void;
  onDeleteLead?: (id: string) => void;
}

export function ModernLeadsTable({ leads, onViewLead, onEditLead, onDeleteLead }: ModernLeadsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['name', 'email', 'company', 'source', 'status', 'createdAt', 'actions'])
  );

  const filteredAndSortedLeads = useMemo(() => {
    let filtered = leads.filter((lead) => {
      const matchesSearch =
        searchQuery === '' ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (sortField === 'createdAt') {
        return direction * (new Date(aVal as any).getTime() - new Date(bVal as any).getTime());
      }

      return direction * String(aVal).localeCompare(String(bVal));
    });

    return filtered;
  }, [leads, searchQuery, statusFilter, sourceFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (column: string) => {
    const newColumns = new Set(visibleColumns);
    if (newColumns.has(column)) {
      newColumns.delete(column);
    } else {
      newColumns.add(column);
    }
    setVisibleColumns(newColumns);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  if (filteredAndSortedLeads.length === 0 && searchQuery === '' && statusFilter === 'all' && sourceFilter === 'all') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No leads yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Start capturing leads through your digital profile. They will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>

        {/* Source Filter */}
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="qr">QR Code</SelectItem>
            <SelectItem value="nfc">NFC</SelectItem>
            <SelectItem value="link">Direct Link</SelectItem>
            <SelectItem value="chat">AI Chat</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['name', 'email', 'company', 'source', 'status', 'createdAt'].map((col) => (
              <DropdownMenuCheckboxItem
                key={col}
                checked={visibleColumns.has(col)}
                onCheckedChange={() => toggleColumn(col)}
                className="capitalize"
              >
                {col}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedLeads.length} of {leads.length} leads
      </div>

      {/* Table */}
      {filteredAndSortedLeads.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No leads found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              No leads match your current filters. Try adjusting your search.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.has('name') && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      Name
                      <SortIcon field="name" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has('email') && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('email')}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      Email
                      <SortIcon field="email" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has('company') && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('company')}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      Company
                      <SortIcon field="company" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has('source') && (
                  <TableHead>Source</TableHead>
                )}
                {visibleColumns.has('status') && (
                  <TableHead>Status</TableHead>
                )}
                {visibleColumns.has('createdAt') && (
                  <TableHead>
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      Created
                      <SortIcon field="createdAt" />
                    </button>
                  </TableHead>
                )}
                {visibleColumns.has('actions') && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedLeads.map((lead) => (
                <TableRow key={lead._id.toString()}>
                  {visibleColumns.has('name') && (
                    <TableCell className="font-medium">{lead.name}</TableCell>
                  )}
                  {visibleColumns.has('email') && (
                    <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                  )}
                  {visibleColumns.has('company') && <TableCell>{lead.company || '-'}</TableCell>}
                  {visibleColumns.has('source') && (
                    <TableCell>
                      <span className={cn(sourceBadgeVariants({ source: lead.source }))}>
                        {lead.source}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has('status') && (
                    <TableCell>
                      <span className={cn(statusBadgeVariants({ status: lead.status }))}>
                        {lead.status}
                      </span>
                    </TableCell>
                  )}
                  {visibleColumns.has('createdAt') && (
                    <TableCell className="text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </TableCell>
                  )}
                  {visibleColumns.has('actions') && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewLead?.(lead._id.toString())}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditLead?.(lead._id.toString())}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDeleteLead?.(lead._id.toString())}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
