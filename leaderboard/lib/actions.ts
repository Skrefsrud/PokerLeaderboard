'use server';

import { getUnmappedAliases } from "./alias";

export async function getUnmappedAliasesAction(): Promise<string[]> {
    return getUnmappedAliases();
}