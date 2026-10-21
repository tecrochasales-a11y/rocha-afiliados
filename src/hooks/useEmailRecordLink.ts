import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/** Open an existing record once after its authorized page finishes loading. */
export function useEmailRecordLink<T extends { id: string }>(records: T[], loading: boolean, open: (record: T) => void) {
  const [params] = useSearchParams();
  const id = params.get('id');
  const handled = useRef<string | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    if (!id || loading || handled.current === id) return;
    handled.current = id;
    const record = records.find(item => item.id === id);
    if (record) open(record);
    else toast({ title: 'Registro não disponível', description: 'O registro deste aviso foi removido ou não está disponível para sua conta.', variant: 'destructive' });
  }, [id, loading, records, open, toast]);
}