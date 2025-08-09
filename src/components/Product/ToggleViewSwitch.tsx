/* ToggleViewSwitch.tsx */
import 'react'
import cls from './ToggleViewSwitch.module.scss'
import GridIcon from '../Icons/GridIcon'
import ListIcon from '../Icons/ListIcon'
import IconFilters from '../Icons/IconFilters';

export type ViewMode = 'grid' | 'list';

interface Props {
    /** Текущий режим отображения */
    view: ViewMode;
    /** Колбэк для смены вида */
    onChangeView: (mode: ViewMode) => void;
    /** Колбэк для открытия модального окна */
    openModal: () => void;
}

const ToggleViewSwitch: React.FC<Props> = ({
    view,
    onChangeView,
    openModal,
}) => {
    return (
        <div className={cls.toolbar} aria-label="Panel for view and sort options">
            <div>
                {/* Filters */}
                <button
                    className={`${cls.iconBtn}`}
                    onClick={() => openModal()}
                    aria-label="filters"
                    type="button"
                >
                    <IconFilters />
                </button>
            </div>
            <div className={cls.viewSwitch}>
                {/* GRID */}
                <button
                    className={`${cls.iconBtn} ${view === 'grid' ? cls.active : ''}`}
                    onClick={() => onChangeView('grid')}
                    aria-label="grid"
                    type="button"
                >
                    <GridIcon />
                </button>

                {/* LIST */}
                <button
                    className={`${cls.iconBtn} ${view === 'list' ? cls.active : ''}`}
                    onClick={() => onChangeView('list')}
                    aria-label="list"
                    type="button"
                >
                    <ListIcon />
                </button>
            </div>
        </div>
    );
};

export default ToggleViewSwitch;