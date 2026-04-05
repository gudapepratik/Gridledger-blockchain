import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Connects to the Socket.io server and subscribes to events.
 * @param {Object} handlers - Map of event name → callback
 *   e.g. { 'order:created': (data) => ..., 'meter:reading': (data) => ... }
 */
export function useSocket(handlers = {}) {
  const socketRef  = useRef(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers   // always latest

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('connect', () => console.log('[socket] connected', socket.id))
    socket.on('disconnect', (r) => console.log('[socket] disconnected', r))
    socket.on('connect_error', (e) => console.warn('[socket] error', e.message))

    // Register all handlers
    Object.keys(handlersRef.current).forEach((event) => {
      socket.on(event, (...args) => handlersRef.current[event]?.(...args))
    })

    return () => socket.disconnect()
  }, [])   // mount once — handlers stay current via ref

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data)
  }, [])

  return { emit }
}
