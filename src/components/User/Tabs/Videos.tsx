// src/components/User/Tabs/Videos.tsx
import React from "react";
import { listUserReels } from "../../../services/reviewApi";
import type { ReviewOut } from "../../../types/review/review";
import ReelsGrid from "./ReelsGrid";
import ReelsGridSkeleton from "./ReelsGrid.Skeleton";
import styles from "./Videos.module.scss";

const REELS_LIMIT = 100;
const SKELETON_COUNT = 6;

type Props = {
    username: string;
};

export default function Videos({ username }: Props) {
    const [items, setItems] = React.useState<ReviewOut[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!username) return;
        let cancelled = false;

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await listUserReels({ username, limit: REELS_LIMIT });
                if (!cancelled) setItems(res);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load user reels");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [username]);

    if (loading) {
        return <ReelsGridSkeleton count={SKELETON_COUNT} />;
    }
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <ReelsGrid
            items={items}
            emptyText="У пользователя пока нет видео-отзывов."
        />
    );
}