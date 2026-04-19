'use client'
import { useEffect } from 'react'

/**
 * Clerk's `mode="modal"` doesn't always lock body scroll — the :has() CSS
 * trick works on current selectors but breaks whenever Clerk ships a class
 * rename. A MutationObserver on <body> gives us a version-proof hook: when
 * any Clerk overlay mounts we flip body overflow to hidden and restore
 * when it unmounts. We also pin scrollTop on the html element so the page
 * doesn't jump back to the top when overflow toggles.
 */

const MODAL_SELECTORS = [
  '.cl-modalBackdrop',
  '[data-clerk-modal-backdrop]',
  '.cl-modal',
  '[data-clerk-modal]',
  '.cl-rootBox[data-clerk-root]',
].join(',')

export function ClerkModalLock() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const body = document.body
    const html = document.documentElement
    let scrollY = 0
    let locked = false

    function lock() {
      if (locked) return
      locked = true
      scrollY = window.scrollY
      body.style.position = 'fixed'
      body.style.top = `-${scrollY}px`
      body.style.left = '0'
      body.style.right = '0'
      body.style.width = '100%'
      html.style.overflow = 'hidden'
    }

    function unlock() {
      if (!locked) return
      locked = false
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      html.style.overflow = ''
      window.scrollTo(0, scrollY)
    }

    function check() {
      const exists = document.querySelector(MODAL_SELECTORS) !== null
      if (exists) lock()
      else unlock()
    }

    const observer = new MutationObserver(check)
    observer.observe(body, { childList: true, subtree: true })
    check()

    return () => {
      observer.disconnect()
      unlock()
    }
  }, [])

  return null
}
