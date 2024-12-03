import { WatchList } from "@/components/pumpfun-watchlist";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, remove, update } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8p3Er3b-X7roB0MkkTDODpwG0bhYrnsE",
  authDomain: "crypto-bot-25c1b.firebaseapp.com",
  projectId: "crypto-bot-25c1b",
  storageBucket: "crypto-bot-25c1b.firebasestorage.app",
  messagingSenderId: "583028094317",
  appId: "1:583028094317:web:3c613dede0214d89169664",
  databaseURL: "https://crypto-bot-25c1b-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

function removeUndefinedProperty(obj: any) {
  let newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key]))
      newObj[key] = removeUndefinedProperty(obj[key]);
    else if (obj[key] !== undefined) newObj[key] = obj[key];
  });
  return newObj;
}

export async function getCommunityWatchlist(
): Promise<WatchList[]> {
  const snapshot = await get(child(dbRef, `community-watchlist`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return (Object.values(data) as WatchList[]).sort((a,b) => {
      const aLike = a.like || 0;
      const bLike = b.like || 0;
      if (bLike > aLike) return 1;
      if (bLike < aLike) return -1;
      return (a.dislike || 0) - (b.dislike || 0);
    });
  } else {
    return [];
  }
}

export async function writeCommunityWatchlist(data: WatchList) {
  await set(
    ref(database, `community-watchlist/${data.address}`),
    removeUndefinedProperty(data)
  );
}

export async function writeCommunityWatchlists(data: WatchList[]) {
  try {
    let existData: {
      [address: string]: any
    } = {};
    const snapshot = await get(child(dbRef, `community-watchlist`));
    if (snapshot.exists()) {
      existData = snapshot.val();
    }
    const modify: {
      [address: string]: any
    } = {};
    data.forEach(item => {
      if (!existData[item.address]) {
        modify[item.address] = removeUndefinedProperty(item)
      }
    });
    if (!Object.keys(modify).length) return;
    await update(
      ref(database, `community-watchlist`),
      modify
    );
  } catch (error) {
    console.log('writeCommunityWatchlists error:', error, data);
  }
}

export async function removeCommunityWatchlist(address: string) {
  await remove(ref(database, `community-watchlist/${address}`));
}