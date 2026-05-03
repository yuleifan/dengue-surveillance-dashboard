// src/lib/data/dataStore.ts

import rawData from './exerciseData.json';
import rawMetadata from './exerciseMetadata.json';
import type { DataRecord, Metadata } from '../types/types';

export const exerciseData = rawData as DataRecord[];
export const exerciseMetadata = rawMetadata as Metadata;