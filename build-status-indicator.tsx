import React from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';

const BuildStatusIndicator = ({ status }) => {
    const [progress] = React.useState(new Animated.Value(0));
    const [downloadVisible, setDownloadVisible] = React.useState(false);

    React.useEffect(() => {
        if (status === 'in-progress') {
            Animated.timing(progress, {
                toValue: 100,
                duration: 5000,
                useNativeDriver: false,
            }).start();
        } else if (status === 'completed') {
            setDownloadVisible(true);
        }
    }, [status]);

    const handleDownload = () => {
        // Functionality to download the build
        console.log('Downloading...');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Build Status:</Text>
            <Text style={styles.status}>{status}</Text>
            <Animated.View style={[styles.progressBar, { width: progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            {downloadVisible && (
                <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
                    <Text style={styles.downloadText}>Download Build</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    status: {
        fontSize: 16,
        marginVertical: 8,
    },
    progressBar: {
        height: 10,
        backgroundColor: '#4caf50',
        borderRadius: 5,
        marginVertical: 10,
    },
    downloadButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
    },
    downloadText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default BuildStatusIndicator;