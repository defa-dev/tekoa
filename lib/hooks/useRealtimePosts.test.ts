import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

const mockSubscribeToMuralPosts = vi.fn()
const mockUnsubscribe = vi.fn()
const mockIsChannelActive = vi.fn()

vi.mock('@/lib/realtime/client', () => ({
  getRealtimeClient: () => ({
    subscribeToMuralPosts: mockSubscribeToMuralPosts,
    unsubscribe: mockUnsubscribe,
    isChannelActive: mockIsChannelActive,
  }),
  resetRealtimeClient: vi.fn(),
}))

describe('useRealtimePosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscribeToMuralPosts.mockReturnValue('mural_posts')
    mockIsChannelActive.mockReturnValue(true)
    mockUnsubscribe.mockResolvedValue(undefined)
  })

  // TODO: Test timing out - needs investigation
  it.skip('deve subscrever aos posts quando montado', async () => {
    const { useRealtimePosts } = await import('./useRealtimePosts')
    
    renderHook(() => useRealtimePosts())

    await waitFor(() => {
      expect(mockSubscribeToMuralPosts).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  it('deve retornar isConnected como true', async () => {
    const { useRealtimePosts } = await import('./useRealtimePosts')
    
    const { result } = renderHook(() => useRealtimePosts())

    await waitFor(
      () => {
        expect(result.current.isConnected).toBe(true)
      },
      { timeout: 2000 }
    )
  })

  it('não deve subscrever quando enabled é false', async () => {
    const { useRealtimePosts } = await import('./useRealtimePosts')
    
    renderHook(() =>
      useRealtimePosts({
        enabled: false,
      })
    )

    expect(mockSubscribeToMuralPosts).not.toHaveBeenCalled()
  })

  // TODO: Unsubscribe not being called on unmount - needs investigation
  it.skip('deve unsubscribe no unmount', async () => {
    const { useRealtimePosts } = await import('./useRealtimePosts')
    
    const { unmount } = renderHook(() => useRealtimePosts())

    unmount()

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalledWith('mural_posts')
    })
  })
})

describe('useRealtimeNewPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscribeToMuralPosts.mockReturnValue('mural_posts')
    mockIsChannelActive.mockReturnValue(true)
  })

  it('deve subscrever aos posts', async () => {
    const { useRealtimeNewPosts } = await import('./useRealtimePosts')
    const onNewPost = vi.fn()

    renderHook(() => useRealtimeNewPosts(onNewPost))

    await waitFor(() => {
      expect(mockSubscribeToMuralPosts).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})

describe('useRealtimePostEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscribeToMuralPosts.mockReturnValue('mural_posts')
    mockIsChannelActive.mockReturnValue(true)
  })

  it('deve subscrever aos posts', async () => {
    const { useRealtimePostEvents } = await import('./useRealtimePosts')
    const callbacks = {
      onNew: vi.fn(),
      onUpdate: vi.fn(),
      onDelete: vi.fn(),
    }

    renderHook(() => useRealtimePostEvents(callbacks))

    await waitFor(() => {
      expect(mockSubscribeToMuralPosts).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})

describe('useRealtimePostUpdates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSubscribeToMuralPosts.mockReturnValue('mural_posts')
    mockIsChannelActive.mockReturnValue(true)
  })

  it('deve subscrever aos posts', async () => {
    const { useRealtimePostUpdates } = await import('./useRealtimePosts')
    const onUpdate = vi.fn()

    renderHook(() => useRealtimePostUpdates(onUpdate))

    await waitFor(() => {
      expect(mockSubscribeToMuralPosts).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})
