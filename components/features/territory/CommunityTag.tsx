/**
 * Tag do território de origem de uma publicação.
 */
export function CommunityTag({ name }: { name: string }) {
  return (
    <span className="inline-flex max-w-[10rem] items-center truncate rounded-sm bg-terra-light px-1.5 py-0.5 font-body text-[10px] font-medium text-terra">
      {name}
    </span>
  )
}
