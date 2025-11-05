import { useQuery } from '@tanstack/react-query'
import { WebhooksListItem } from './webhooks-list-item'
import { webhookListSchema } from '../http/schemas/webhooks'

export function WebhooksList() {
  const { data } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async() => {
      const response = await fetch('http://localhost:3333/api/webhooks')
      const data = await response.json()

      return webhookListSchema.parse(data)
    },
  })


  return (
    <div className="flex-1 overflow-auto">
      <div className="space-y-1 p-2">
        <pre>
            {JSON.stringify(data)}
        </pre>
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
        <WebhooksListItem />
      </div>
    </div>
  )
}
