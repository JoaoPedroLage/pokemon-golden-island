// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn'] 
        : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    if (!this.isConnected) {
      await this.connectWithRetry();
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.isConnected = false;
    }
  }

  private async connectWithRetry(retries = 15, delay = 3000) {
    // Wait a bit before first attempt
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    for (let i = 0; i < retries; i++) {
      try {
        // Check if DATABASE_URL is defined
        if (!process.env.DATABASE_URL) {
          throw new Error('DATABASE_URL is not defined');
        }
        
        await this.$connect();
        this.isConnected = true;
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Don't log "incomplete startup packet" errors as warnings
        if (!errorMessage.includes('incomplete') && !errorMessage.includes('startup packet')) {
          this.logger.warn(
            `Failed to connect to database (attempt ${i + 1}/${retries}): ${errorMessage}`,
          );
        }
        
        if (i < retries - 1) {
          // Exponential backoff with maximum of 15 seconds
          const waitTime = Math.min(delay * Math.pow(1.5, i), 15000);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        } else {
          this.logger.error('Failed to connect to database after all retries');
          throw error;
        }
      }
    }
  }
}
