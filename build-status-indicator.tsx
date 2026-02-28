import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export interface BuildStatusProps {
  buildId: string;
  status: 'idle' | 'queued' | 'building' | 'finished' | 'failed';
  progress?: number;
  downloadUrl?: string;
  error?: string;
  onDownload?: (url: string) => void;
  onRetry?: () => void;
}

export const BuildStatusIndicator: React.FC<BuildStatusProps> = ({
  buildId,
  status,
  progress = 0,
  downloadUrl,
  error,
  onDownload,
  onRetry,
}) => {
  const colors = useColors();
  const [progressAnim] = React.useState(new Animated.Value(0));

  useEffect(() => {
    if (status === 'building' && progress) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, status]);

  const getStatusColor = () => {
    switch (status) {
      case 'building':
      case 'queued':
        return colors.primary;
      case 'finished':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return colors.muted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'building':
        return 'settings';
      case 'queued':
        return 'schedule';
      case 'finished':
        return 'checkmark-circle.fill';
      case 'failed':
        return 'exclamationmark.circle.fill';
      default:
        return 'question';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'building':
        return 'Building...';
      case 'queued':
        return 'Queued';
      case 'finished':
        return 'Build Complete';
      case 'failed':
        return 'Build Failed';
      default:
        return 'Idle';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <IconSymbol
            name={getStatusIcon()}
            size={20}
            color={getStatusColor()}
          />
          <Text style={[styles.label, { color: colors.text }]}>  
            {getStatusLabel()}
          </Text>
        </View>
        <Text style={[styles.buildId, { color: colors.muted }]}>  
          #{buildId.slice(0, 8)}
        </Text>
      </View>

      {/* Progress Bar */}
      {(status === 'building' || status === 'queued') && (
        <View style={[styles.progressContainer, { backgroundColor: colors.muted }]}>  
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
      )}

      {/* Progress Text */}
      {status === 'building' && (
        <Text style={[styles.progressText, { color: colors.muted }]}>  
          {progress}% complete
        </Text>
      )}

      {/* Error Message */}
      {status === 'failed' && error && (
        <View style={[styles.errorBox, { backgroundColor: '#fee' }]}>  
          <Text style={[styles.errorText, { color: '#c00' }]}>  
            {error}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>  
        {status === 'finished' && downloadUrl && (
          <TouchableOpacity  
            style={[styles.button, { backgroundColor: colors.primary }]}  
            onPress={() => onDownload?.(downloadUrl)}
          >
            <IconSymbol name="arrow.down.circle.fill" size={18} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Download APK</Text>
          </TouchableOpacity>
        )}  

        {status === 'failed' && (
          <TouchableOpacity  
            style={[styles.button, { backgroundColor: colors.primary }]}  
            onPress={() => onRetry?.()}
          >
            <IconSymbol name="arrow.clockwise" size={18} color="#fff" />
            <Text style={[styles.buttonText, { color: '#fff' }]}>Retry Build</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  buildId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});