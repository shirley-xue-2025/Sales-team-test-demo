import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  // Track internal checked state with a ref to detect changes
  const prevCheckedRef = React.useRef(checked);
  
  // Force re-render when props.checked changes from parent
  React.useEffect(() => {
    prevCheckedRef.current = checked;
  }, [checked]);

  // Enhanced handler to log and process checked changes
  const handleCheckedChange = React.useCallback((newChecked: CheckboxPrimitive.CheckedState) => {
    console.log("[Checkbox] onCheckedChange called with:", newChecked, "previous was:", prevCheckedRef.current);
    
    // Ensure the state change is processed by the parent
    if (onCheckedChange) {
      // Force the opposite of the current value to ensure toggle
      const forcedValue = typeof checked === 'boolean' && newChecked === checked 
        ? !checked
        : newChecked;
        
      console.log("[Checkbox] Passing value to parent:", forcedValue);
      onCheckedChange(forcedValue);
    }
  }, [onCheckedChange, checked]);

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
