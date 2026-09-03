import { VALIDATION_DEFAULTS } from "@/shared";

import {
    MenuTitleTooLongException,
    MenuTitleTooShortException,
} from "../exceptions/menu.exception";

export class MenuTitle {
    public static readonly MIN_LENGTH = VALIDATION_DEFAULTS.NAME.MIN_LENGTH;
    public static readonly MAX_LENGTH = VALIDATION_DEFAULTS.NAME.MAX_LENGTH;

    private constructor(
        public readonly value: string,
    ) { }

    public static create(raw: string): MenuTitle {
        const value = raw.trim();

        if (value.length < MenuTitle.MIN_LENGTH) {
            throw new MenuTitleTooShortException(MenuTitle.MIN_LENGTH);
        }

        if (value.length > MenuTitle.MAX_LENGTH) {
            throw new MenuTitleTooLongException(MenuTitle.MAX_LENGTH);
        }

        return new MenuTitle(value);
    }
}
