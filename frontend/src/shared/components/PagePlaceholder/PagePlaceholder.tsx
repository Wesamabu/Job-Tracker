import { Box, Button, Center, Container, Icon, Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';

type PagePlaceholderAction = {
    label: string;
    onClick?: () => void;
    href?: string;
    variant?: 'solid' | 'outline' | 'ghost' | 'link';
    colorScheme?: string;
    isDisabled?: boolean;
    icon?: ReactElement;
    size?: string;
};

type PagePlaceholderProps = {
    title: string;
    message: string;
    guidance?: string;
    action?: PagePlaceholderAction;
};

function PagePlaceholder({ title, message, guidance, action }: PagePlaceholderProps) {
    return (
        <Container maxW="container.xl" py={8}>
            <Center minH="60vh">
                <Box
                    p={12}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="md"
                    textAlign="center"
                    maxW="600px"
                    borderTop="4px solid"
                    borderTopColor="blue.500"
                >
                    <VStack spacing={6}>
                        <Box>
                            <Text fontSize="3xl" fontWeight="bold" mb={4}>
                                {title}
                            </Text>
                            <Text fontSize="lg" color="gray.600" mb={2}>
                                {message}
                            </Text>
                            {guidance ? (
                                <Text fontSize="md" color="gray.500" mt={4}>
                                    {guidance}
                                </Text>
                            ) : null}
                        </Box>

                        {action ? (
                            <Button
                                type="button"
                                variant={action.variant ?? 'solid'}
                                colorScheme={action.colorScheme ?? 'blue'}
                                size={action.size ?? 'lg'}
                                onClick={action.onClick}
                                as={action.href ? 'a' : undefined}
                                href={action.href}
                                isDisabled={action.isDisabled ?? (!action.onClick && !action.href)}
                                leftIcon={action.icon}
                            >
                                {action.label}
                            </Button>
                        ) : null}
                    </VStack>
                </Box>
            </Center>
        </Container>
    );
}

export default PagePlaceholder;
