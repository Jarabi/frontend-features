import { Skeleton, SkeletonAvatar, SkeletonImage, SkeletonListItem, SkeletonText } from "./Skeletons";

// Dashboard skeleton with widgets
export const SkeletonDashboard = () => (
    <div className="skeleton-dashboard">
        <div className="dashboard-header">
            <Skeleton width='200px' height='32px' />
            <Skeleton width='120px' height='40px' borderRadius="20px" />
        </div>
        <div className="dashboard-stats">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card">
                    <SkeletonText lines={2} lineHeight="1rem" />
                    <Skeleton width='60px' height='28px' />
                </div>
            ))}
        </div>
        <div className="dashboard-chart">
            <Skeleton height='300px' borderRadius="12px" />
        </div>
        <div className="dashboard-recent">
            <Skeleton width='180px' height="24px" />
            {[...Array(5)].map((_, i) => (
                <SkeletonListItem key={i} />
            ))}
        </div>
    </div>
);

// E-commerce product page skeleton
export const SkeletonProductPage = () => (
    <div className="skeleton-product-page">
        <div className="product-gallery">
            <SkeletonImage aspectRatio="1/1" />
            <div className="thumbnail-strip">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} width='80px' height='80px' borderRadius="8px" />
                ))}
            </div>
        </div>
        <div className="product-info">
            <Skeleton width='80%' height='32px' />
            <Skeleton width='40%' height='24px' />
            <Skeleton width='60%' height='28px' />
            <SkeletonText lines={4} />
            <div className="product-actions">
                <Skeleton width='150px' height='48px' borderRadius="24px" />
                <Skeleton width='150px' height='48px' borderRadius="24px" />
            </div>
        </div>
    </div>
);

// Social media feed skeleton
export const SkeletonFeed = ({ count = 3 }) => (
    <div className="skeleton-feed">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="feed-post">
                <div className="post-header">
                    <SkeletonAvatar size="40px" />
                    <div className="post-meta">
                        <Skeleton width='120px' height='16px' />
                        <Skeleton width='80px' height='12px' />
                    </div>
                </div>
                <SkeletonText lines={3} />
                <SkeletonImage aspectRatio="4/3" />
                <div className="post-actions">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} width='60px' height='32px' borderRadius="16px" />
                    ))}
                </div>
            </div>
        ))}
    </div>
);