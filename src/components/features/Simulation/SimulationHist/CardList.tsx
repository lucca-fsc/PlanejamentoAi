import { ExternalLink, Goal, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { Divider } from '@/components/shared/Divider'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

interface CardListProps {
  id: string
  title: string
  createdAt: string
  cost: string
  goalDeadline: string
  goalAmount: string
  onDeleted?: (id: string) => void
}

export function CardList({
  id,
  title,
  createdAt,
  cost,
  goalDeadline,
  goalAmount,
  onDeleted,
}: CardListProps) {
  const navigate = useNavigate()
  const { deleteFormData } = useSimulationStorage()

  const handleDeleteForm = (id: string) => {
    if (!id) {
      return
    }

    const deleted = deleteFormData(id)

    if (deleted) {
      onDeleted?.(id)
    }
  }

  return (
    <div
      className={[
        'grid grid-cols-1 gap-4 rounded-2xl bg-card px-5 py-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)] md:grid-cols-[minmax(0,1fr)_auto_190px] md:items-stretch',
      ].join(' ')}
    >
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        <div className="rounded-lg bg-list-bg-icon p-2">
          <Goal size={20} className="text-primary" />
        </div>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(160px,1.6fr)_minmax(120px,1fr)_minmax(90px,0.8fr)_minmax(140px,1fr)] lg:items-center">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="line-clamp-2 text-sm font-semibold text-foreground">{title}</p>
            <p className="text-muted-foreground text-xs">{createdAt}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground  text-sm">Custo da Meta</p>
            <p className="text-foreground font-semibold text-sm">R$ {cost}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground  text-sm">Prazo</p>
            <p className="text-foreground font-semibold text-sm"> {goalDeadline} meses</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground  text-sm">Economia Mensal</p>
            <p className="text-foreground font-semibold text-sm">R$ {goalAmount}</p>
          </div>
        </div>
      </div>
      <Divider orientation='vertical' className="hidden md:block" />
      <div className="flex items-center justify-end gap-3 border-t border-border pt-4 md:border-t-0 md:pt-0">
        <Button
          type="button"
          variant="ghost"
          icon={Trash2}
          className="text-red-500"
          onClick={() => handleDeleteForm(id)} />
        <Button
          variant="secondary"
          icon={ExternalLink}
          className="min-w-36 whitespace-nowrap !py-1"
          onClick={() => void navigate(`/detalhes/${id}`)}>
          Ver detalhes
        </Button>
      </div>
    </div>
  )
}
