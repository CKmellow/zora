import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const activities = [
  {
    title: 'Transaction funded',
    description: 'Nike Air Force 1 was funded by John Kamau.',
    time: 'Today · 10:42 AM',
    icon: '✓',
    type: 'success',
  },
  {
    title: 'Item marked in transit',
    description: 'Adidas Campus was handed over for delivery.',
    time: 'Yesterday · 4:18 PM',
    icon: '→',
    type: 'transit',
  },
  {
    title: 'Transaction created',
    description: 'Adidas Campus transaction was created.',
    time: 'Yesterday · 2:06 PM',
    icon: '+',
    type: 'default',
  },
  {
    title: 'Transaction funded',
    description: 'Nike Air Force 1 was funded by John Kamau.',
    time: '12 Aug · 11:31 AM',
    icon: '✓',
    type: 'success',
  },
];

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>SELLER ACCOUNT</Text>
            <Text style={styles.title}>Activity</Text>
          </View>

          <View style={styles.activityCount}>
            <Text style={styles.activityCountText}>12</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>
              Recent activity
            </Text>
            <Text style={styles.summaryTitle}>
              Everything in one place
            </Text>
          </View>

          <View style={styles.pulse}>
            <View style={styles.pulseDot} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>

        <View style={styles.timeline}>
          {activities.map((activity, index) => (
            <View key={`${activity.title}-${index}`}>
              <View style={styles.activityRow}>
                <View
                  style={[
                    styles.icon,
                    activity.type === 'success' &&
                      styles.successIcon,
                    activity.type === 'transit' &&
                      styles.transitIcon,
                  ]}
                >
                  <Text style={styles.iconText}>
                    {activity.icon}
                  </Text>
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {activity.title}
                  </Text>

                  <Text style={styles.description}>
                    {activity.description}
                  </Text>

                  <Text style={styles.time}>
                    {activity.time}
                  </Text>
                </View>
              </View>

              {index < activities.length - 1 && (
                <View style={styles.line} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#999999',
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111111',
  },

  activityCount: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  summaryCard: {
    backgroundColor: '#111111',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  summaryLabel: {
    color: '#A3A3A3',
    fontSize: 11,
    marginBottom: 6,
  },

  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  pulse: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },

  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 17,
  },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  successIcon: {
    backgroundColor: '#DCFCE7',
  },

  transitIcon: {
    backgroundColor: '#DBEAFE',
  },

  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  activityContent: {
    flex: 1,
    paddingTop: 1,
  },

  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },

  description: {
    fontSize: 12,
    lineHeight: 18,
    color: '#666666',
    marginBottom: 5,
  },

  time: {
    fontSize: 10,
    color: '#999999',
  },

  line: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
    marginLeft: 18,
    marginVertical: 4,
  },
});