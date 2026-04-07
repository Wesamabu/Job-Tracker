import { useState } from 'react';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Heading,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    IconButton,
    Link,
    Text,
    VStack,
    Divider,
    useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import authService from '@/features/auth/services/auth.service';

function LoginPage() {
    const navigate = useNavigate();
    const toast = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validate = () => {
        const errs: typeof errors = {};
        if (!email) errs.email = 'Email is required.';
        if (!password) errs.password = 'Password is required.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await authService.login({ email, password });
            navigate('/dashboard', { replace: true });
        } catch {
            toast({
                title: 'Login failed.',
                description: 'Invalid email or password.',
                status: 'error',
                duration: 4000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bgGradient="linear(to-br, blue.50, white, blue.100)"
            px={4}
        >
            <Box
                w="full"
                maxW="420px"
                bg="white"
                borderRadius="2xl"
                boxShadow="xl"
                p={{ base: 8, md: 10 }}
            >
                {/* Logo + Brand */}
                <Flex align="center" justify="center" gap={3} mb={8}>
                    <Image
                        src="/logo.jpeg"
                        alt="Job Tracker Logo"
                        boxSize="64px"
                        objectFit="contain"
                    />
                    <VStack align="start" spacing={0}>
                        <Heading size="lg" color="brand.600" lineHeight="1" letterSpacing="-0.5px">
                            Job Tracker
                        </Heading>
                        <Text fontSize="sm" color="teal.600" fontStyle="italic">
                            Smart Track. Better Career.
                        </Text>
                    </VStack>
                </Flex>

                <Divider mb={6} />

                <Heading size="md" mb={6} color="gray.700" textAlign="center">
                    Sign in to your account
                </Heading>

                <Box as="form" onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel fontSize="sm" color="gray.600">Email address</FormLabel>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                focusBorderColor="brand.500"
                                size="lg"
                                borderRadius="lg"
                            />
                            <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    focusBorderColor="brand.500"
                                    borderRadius="lg"
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                        variant="ghost"
                                        size="sm"
                                        color="gray.400"
                                        onClick={() => setShowPassword((v) => !v)}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="brand"
                            width="full"
                            size="lg"
                            borderRadius="lg"
                            isLoading={loading}
                            loadingText="Signing in…"
                            mt={2}
                            bgGradient="linear(to-r, brand.500, brand.700)"
                            _hover={{ bgGradient: 'linear(to-r, brand.600, brand.800)' }}
                            _active={{ bgGradient: 'linear(to-r, brand.700, brand.900)' }}
                        >
                            Sign In
                        </Button>
                    </VStack>
                </Box>

                <Text textAlign="center" fontSize="sm" color="gray.500" mt={6}>
                    Don&apos;t have an account?{' '}
                    <Link as={RouterLink} to="/register" color="brand.600" fontWeight="semibold">
                        Create one
                    </Link>
                </Text>
            </Box>
        </Flex>
    );
}

export default LoginPage;
