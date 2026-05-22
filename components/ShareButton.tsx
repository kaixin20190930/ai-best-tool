'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check } from 'lucide-react';
import { trackShare } from '@/app/actions/analytics';

interface ShareButtonProps {
  toolId: string;
  toolName: string;
  toolTitle: string;
  toolDescription: string;
  userId?: string;
  className?: string;
}

/**
 * ShareButton Component
 *
 * Provides social sharing functionality with multiple platforms
 * and tracks share events for analytics
 */
export default function ShareButton({
  toolId,
  toolName,
  toolTitle,
  toolDescription,
  userId,
  className = '',
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate share URL with UTM parameters
  const getShareUrl = (platform: string) => {
    const baseUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/ai/${toolName}`
      : '';

    const utmParams = new URLSearchParams({
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: 'tool_share',
    });

    return `${baseUrl}?${utmParams.toString()}`;
  };

  const handleShare = async (platform: string) => {
    const shareUrl = getShareUrl(platform);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(toolTitle);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        break;
      default:
        return;
    }

    // Track share event
    trackShare(toolId, platform, userId).catch((err) =>
      console.error('Failed to track share:', err),
    );

    // Open share link in new window
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }

    setShowMenu(false);
  };

  // Use native share API if available (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: toolTitle,
          text: toolDescription,
          url: getShareUrl('native'),
        });

        // Track share event
        trackShare(toolId, 'native', userId).catch((err) =>
          console.error('Failed to track share:', err),
        );
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type='button'
        onClick={handleNativeShare}
        className='flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-100'
        aria-label='Share'
      >
        <Share2 className='size-4' />
        <span className='hidden sm:inline'>Share</span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            role='button'
            tabIndex={0}
            className='fixed inset-0 z-40'
            onClick={() => setShowMenu(false)}
            onKeyDown={(e) => e.key === 'Escape' && setShowMenu(false)}
            aria-label='Close menu'
          />

          {/* Share menu */}
          <div className='theme-surface absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-200 shadow-sm'>
            <div className='p-2'>
              <button
                type='button'
                onClick={() => handleShare('facebook')}
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50'
              >
                <Facebook className='size-5 text-cyan-700' />
                Facebook
              </button>

              <button
                type='button'
                onClick={() => handleShare('twitter')}
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50'
              >
                <Twitter className='size-5 text-sky-500' />
                Twitter
              </button>

              <button
                type='button'
                onClick={() => handleShare('linkedin')}
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50'
              >
                <Linkedin className='size-5 text-cyan-800' />
                LinkedIn
              </button>

              <div className='my-1 border-t border-slate-200' />

              <button
                type='button'
                onClick={() => handleShare('copy')}
                className='flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50'
              >
                {copied ? (
                  <>
                    <Check className='size-5 text-emerald-600' />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className='size-5 text-slate-600' />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
