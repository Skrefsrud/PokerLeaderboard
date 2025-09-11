'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { getUnmappedAliasesAction } from '@/lib/actions';

export function UnmappedAliases() {
  const [unmapped, setUnmapped] = useState<string[]>([]);

  useEffect(() => {
    async function fetchUnmapped() {
      const unmappedAliases = await getUnmappedAliasesAction();
      setUnmapped(unmappedAliases);
    }
    fetchUnmapped();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Show Unmapped Aliases</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unmapped Aliases</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ul>
            {unmapped.map((alias) => (
              <li key={alias}>{alias}</li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}