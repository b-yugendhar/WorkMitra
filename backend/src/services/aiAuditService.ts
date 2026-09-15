import AIAuditLog from '../models/AIAuditLog';

export interface AuditLogOptions {
    userId?: string | undefined;
    featureName: string;
    relatedEntityId?: string | undefined;
    status?: 'success' | 'failed' | 'fallback' | undefined;
    modelProvider?: string | undefined;
    processingDurationMs?: number | undefined;
    requiresHumanReview?: boolean | undefined;
    metadata?: Record<string, any> | undefined;
}

export const logAIOperation = async (options: AuditLogOptions): Promise<void> => {
    try {
        await AIAuditLog.create({
            userId: options.userId,
            featureName: options.featureName,
            relatedEntityId: options.relatedEntityId,
            status: options.status || 'success',
            modelProvider: options.modelProvider || process.env.AI_MODEL || 'WorkMitra-AI-Engine',
            processingDurationMs: options.processingDurationMs || 0,
            requiresHumanReview: options.requiresHumanReview || false,
            metadata: options.metadata,
        });
    } catch (err) {
        console.error('Failed to write AI audit log:', err);
    }
};
