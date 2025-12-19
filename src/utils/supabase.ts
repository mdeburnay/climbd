import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vbrtofwoiyuftfjzvmhs.supabase.co";
const supabasePublishableKey = "sb_publishable_hSx9UqfgcbSTl7rJd33l3Q_KLILi9JC";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
	auth: {
		storage: AsyncStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
