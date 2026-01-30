# TODO

## Technical Debt

### SafeAreaView Deprecation
- **Location:** `GuitarSlam/app/editor/create.tsx:123`
- **Issue:** `SafeAreaView` from `react-native` has been deprecated
- **Solution:** Migrate to `react-native-safe-area-context`
- **Reference:** https://github.com/th3rdwave/react-native-safe-area-context
- **Priority:** Low (warning only, still functional)

```bash
# To fix:
pnpm add react-native-safe-area-context
```

Then update imports:
```tsx
// Before
import { SafeAreaView } from "react-native";

// After
import { SafeAreaView } from "react-native-safe-area-context";
```
