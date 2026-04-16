import './Skeletons.css';

const toSafeCount = (value, fallBack = 0) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallBack;
};

// Base skeleton with shimmer animation
export const Skeleton = ({
    width,
    height,
    borderRadius = '8px',
    className = '',
}) => (
    <div
        aria-hidden='true'
        className={`skeleton ${className}`}
        style={{
            width: width || '100%',
            height: height || '100%',
            borderRadius,
        }}
    />
);

// Skeleton for text lines
export const SkeletonText = ({
    lines = 1,
    lineHeight = '1.5rem',
    lastLineWidth = '60%',
}) => {
    const safeLines = toSafeCount(lines);
    return (
        <div className='skeleton-text'>
            {Array.from({ length: safeLines }, (_, i) => (
                <Skeleton
                    key={i}
                    height={lineHeight}
                    width={
                        i === safeLines - 1 && safeLines > 1
                            ? lastLineWidth
                            : '100%'
                    }
                    className='skeleton-text-line'
                />
            ))}
        </div>
    );
};

// Skeleton for avatar circle
export const SkeletonAvatar = ({ size = '48px' }) => (
    <Skeleton width={size} height={size} borderRadius='50%' />
);

// Skeleton for images
export const SkeletonImage = ({ aspectRatio = '16/9', borderRadius = '8px' }) => (
    <div className='skeleton-image' style={{ aspectRatio }}>
        <Skeleton width='100%' height='100%' borderRadius={borderRadius} />
    </div>
);

// Card skeleton (for blog posts, products, etc.)
export const SkeletonCard = ({ hasImage = true, hasAvatar = false }) => (
    <div className='skeleton-card'>
        {hasImage && <SkeletonImage />}
        <div className='skeleton-card-content'>
            {hasAvatar && (
                <div className='skeleton-card-header'>
                    <SkeletonAvatar size='40px' />
                    <SkeletonText lines={2} lineHeight='1rem' />
                </div>
            )}
            <SkeletonText lines={3} lineHeight='1.2rem' />
            <div className='skeleton-card-footer'>
                <Skeleton width='80px' height='2rem' borderRadius='4px' />
            </div>
        </div>
    </div>
);

// List item skeleton (for search results, comments, etc.)
export const SkeletonListItem = () => (
    <div className='skeleton-list-item'>
        <SkeletonAvatar size='32px' />
        <div className='skeleton-list-item-content'>
            <SkeletonText lines={2} lineHeight='1rem' />
        </div>
    </div>
);

// Profile header skeleton
export const SkeletonProfile = () => (
    <div className='skeleton-profile'>
        <div className='skeleton-profile-header'>
            <SkeletonAvatar size='80px' />
            <Skeleton width='120px' height='24px' borderRadius='4px' />
        </div>
        <SkeletonText lines={3} lineHeight='1rem' />
        <div className='skeleton-profile-stats'>
            {[...Array(3)].map((_, i) => (
                <div key={i} className='skeleton-stat'>
                    <Skeleton width='60px' height='20px' />
                    <Skeleton width='40px' height='16px' />
                </div>
            ))}
        </div>
    </div>
);

// Grid of cards (for product listings, galleries)
export const SkeletonGrid = ({ columns = 3, count = 6, hasImage = true }) => (
    <div className='skeleton-grid' style={{ '--grid-columns': columns }}>
        {[...Array(toSafeCount(count))].map((_, i) => (
            <SkeletonCard key={i} hasImage={hasImage} />
        ))}
    </div>
);

// Comments section skeleton
export const SkeletonComments = ({ count = 3 }) => (
    <div className='skeleton-comments'>
        <Skeleton width='150px' height='24px' borderRadius='4px' />
        {[...Array(toSafeCount(count))].map((_, i) => (
            <SkeletonListItem key={i} />
        ))}
    </div>
);
