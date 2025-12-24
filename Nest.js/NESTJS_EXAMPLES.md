# NestJS Implementation Examples

## 1. OpenAI Service Example

### `src/openai/openai.service.ts`
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async analyzeResume(resumeText: string, fileName: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert ATS resume reviewer. Respond ONLY in valid JSON.',
          },
          {
            role: 'user',
            content: `
              Analyze the following resume and return JSON:
              {
                "atsScore": number,
                "strengths": string[],
                "weaknesses": string[],
                "suggestions": string[]
              }
              
              Resume:
              ${resumeText}
            `,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(content);
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
```

### `src/openai/openai.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { OpenAIController } from './openai.controller';

@Module({
  imports: [ConfigModule],
  controllers: [OpenAIController],
  providers: [OpenAIService],
  exports: [OpenAIService], // Export for use in other modules
})
export class OpenAIModule {}
```

## 2. Google Auth Example

### `src/auth/strategies/google.strategy.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
```

### `src/auth/auth.controller.ts`
```typescript
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return req.user;
  }
}
```

### `src/auth/auth.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## 3. Resume Controller with Auth Guard

### `src/resume/resume.controller.ts`
```typescript
import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ResumeService } from './resume.service';
import { AnalyzeResumeDto } from './dto/analyze-resume.dto';

@Controller('api/resume-analyser')
@UseGuards(AuthGuard('jwt')) // Protect with JWT
export class ResumeController {
  constructor(private resumeService: ResumeService) {}

  @Post()
  @UseInterceptors(FileInterceptor('resume', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async analyzeResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    return this.resumeService.analyzeResume(file);
  }
}
```

## 4. Microservices Setup

### Main App (API Gateway) - `src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Connect to OpenAI microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
```

### OpenAI Microservice - `microservices/openai-service/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OpenAIMicroserviceModule } from './openai-microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OpenAIMicroserviceModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3001,
      },
    },
  );

  await app.listen();
}
bootstrap();
```

### OpenAI Microservice Controller
```typescript
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OpenAIService } from './openai.service';

@Controller()
export class OpenAIMicroserviceController {
  constructor(private openaiService: OpenAIService) {}

  @MessagePattern('analyze_resume')
  async analyzeResume(@Payload() data: { resumeText: string; fileName: string }) {
    return this.openaiService.analyzeResume(data.resumeText, data.fileName);
  }
}
```

### Calling Microservice from Main App
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ResumeService {
  constructor(
    @Inject('OPENAI_SERVICE') private openaiClient: ClientProxy,
  ) {}

  async analyzeResume(file: Buffer, fileName: string) {
    const resumeText = await this.extractTextFromPDF(file);
    
    // Call microservice
    return this.openaiClient
      .send('analyze_resume', { resumeText, fileName })
      .toPromise();
  }
}
```

## 5. Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret_key

# Microservices
OPENAI_SERVICE_HOST=localhost
OPENAI_SERVICE_PORT=3001
```

## 6. Testing Example

### `test/openai.service.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from '../src/openai/openai.service';
import { ConfigService } from '@nestjs/config';

describe('OpenAIService', () => {
  let service: OpenAIService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'OPENAI_API_KEY') return 'test-key';
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should analyze resume', async () => {
    const mockResponse = {
      atsScore: 85,
      strengths: ['Good formatting'],
      weaknesses: ['Missing keywords'],
      suggestions: ['Add more keywords'],
    };

    jest.spyOn(service['openai'].chat.completions, 'create').mockResolvedValue({
      choices: [{
        message: { content: JSON.stringify(mockResponse) },
      }],
    } as any);

    const result = await service.analyzeResume('resume text', 'resume.pdf');
    expect(result).toEqual(mockResponse);
  });
});
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each module handles one responsibility
2. **Easy Testing**: Services can be mocked independently
3. **Scalability**: Microservices can be deployed separately
4. **Type Safety**: Full TypeScript support with DTOs
5. **Security**: Guards protect routes automatically
6. **Maintainability**: Clear structure and dependency injection

